import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { X, Mic, Send } from 'lucide-react-native';
import { sendAssistantMessage } from '../../services/assistant.service';
import { getCinemasList } from '../../services/info.service';
import robotAvatar from '../../assets/images/robotIA.png';
import { theme } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const [dbCinemas, setDbCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: '¡Hola! Soy tu asistente de Cineflix. ¿En qué te puedo ayudar hoy?',
      sender: 'bot',
    },
  ]);

  const scrollViewRef = useRef(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const speechRef = useRef(null);

  // Auto-scroll al final
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isLoading]);

  // Ocultar burbuja después de 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Animación de bounce para loading
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isLoading]);

  // Animación de pulse para micrófono
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Verificar disponibilidad de voz
  useEffect(() => {
    const checkVoice = async () => {
      try {
        const module = await import('expo-speech-recognition');
        speechRef.current = module;
        const available = await module.isAvailable();
        setVoiceAvailable(available);
      } catch {
        speechRef.current = null;
        setVoiceAvailable(false);
      }
    };
    checkVoice();
  }, []);

  // Cargar cines al montar
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await getCinemasList();
        if (Array.isArray(data)) {
          setDbCinemas(data);
        }
      } catch (error) {
        console.error(
          'No se pudieron cargar los cines para el asistente:',
          error
        );
      }
    };
    fetchCinemas();
  }, []);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setShowBubble(false);
  };

  const handleSelectCinema = async (id, name) => {
    setCinemaId(id);

    const selectMessage = {
      id: `select-${Date.now()}`,
      text: `Estoy en la sede ${name}`,
      sender: 'user',
    };

    setMessages((prev) =>
      prev
        .map((msg) =>
          msg.id === 'welcome' || msg.id.startsWith('ask-cinema')
            ? { ...msg, isCinemaSelector: false }
            : msg
        )
        .concat(selectMessage)
    );

    if (pendingMessage) {
      await processBotResponse(pendingMessage, id);
      setPendingMessage('');
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-confirm-${Date.now()}`,
          text: `¡Excelente! Sede ${name} seleccionada perfectamente. Ahora sí, ¿en qué te puedo ayudar? Puedes consultarme sobre películas en cartelera, asientos disponibles o combos de snacks.`,
          sender: 'bot',
        },
      ]);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      speechRef.current?.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechRef.current) {
      Alert.alert(
        'Voz no disponible',
        'El reconocimiento de voz no está disponible en este entorno. Puedes escribir tu mensaje.'
      );
      return;
    }

    try {
      const permission = await speechRef.current.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso al micrófono para el reconocimiento de voz.'
        );
        return;
      }

      setIsListening(true);

      speechRef.current.addListener('result', (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      });

      speechRef.current.addListener('end', () => {
        setIsListening(false);
      });

      speechRef.current.startListening({
        lang: 'es-ES',
        interimResults: false,
        maxAlternatives: 1,
      });
    } catch (error) {
      console.error('Error al iniciar reconocimiento de voz:', error);
      setIsListening(false);
      Alert.alert(
        'Voz no disponible',
        'El reconocimiento de voz no está disponible en este momento. Puedes escribir tu mensaje.'
      );
    }
  };

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    const newUserMessage = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    if (!cinemaId) {
      setPendingMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `ask-cinema-${Date.now()}`,
          text: 'Para responder a tu consulta correctamente, necesito que primero selecciones una sucursal:',
          sender: 'bot',
          isCinemaSelector: true,
        },
      ]);
      return;
    }

    await processBotResponse(userMessage, cinemaId);
  };

  const processBotResponse = async (messageText, currentCinemaId) => {
    setIsLoading(true);
    try {
      const result = await sendAssistantMessage(messageText, currentCinemaId);

      if (result.success && result.data?.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: result.data.message,
            sender: 'bot',
          },
        ]);
      } else {
        throw new Error('Estructura de respuesta inválida');
      }
    } catch (error) {
      console.error('Error al obtener respuesta de la IA:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: 'Lo siento, hubo un problema al conectar con el servidor de IA. Por favor, intenta de nuevo.',
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* VENTANA DE CHAT */}
      {isOpen && (
        <View style={styles.chatWindow}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image source={robotAvatar} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerTitle}>Asistente Cineflix</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>En línea</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Mensajes */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesArea}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => (
              <View key={msg.id} style={styles.messageGroup}>
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user'
                      ? styles.userMessage
                      : styles.botMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user'
                        ? styles.userMessageText
                        : styles.botMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {msg.isCinemaSelector && dbCinemas.length > 0 && (
                  <View style={styles.cinemaSelector}>
                    {dbCinemas.map((cinema) => (
                      <TouchableOpacity
                        key={cinema.id}
                        onPress={() =>
                          handleSelectCinema(cinema.id, cinema.name)
                        }
                        style={styles.cinemaButton}
                      >
                        <Text style={styles.cinemaButtonText}>
                          {cinema.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {msg.isCinemaSelector && dbCinemas.length === 0 && (
                  <Text style={styles.loadingText}>
                    Cargando sucursales disponibles...
                  </Text>
                )}
              </View>
            ))}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <Animated.View
                  style={[
                    styles.loadingDot,
                    { transform: [{ translateY: bounceAnim }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.loadingDot,
                    {
                      transform: [{ translateY: bounceAnim }],
                      marginHorizontal: 3,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.loadingDot,
                    { transform: [{ translateY: bounceAnim }] },
                  ]}
                />
              </View>
            )}
          </ScrollView>

          {/* Área de entrada */}
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                placeholder={
                  isListening ? 'Escuchando tu voz...' : 'Escribe un mensaje...'
                }
                placeholderTextColor="#6B7280"
                editable={!isLoading}
                returnKeyType="send"
              />

              {voiceAvailable && (
                <TouchableOpacity
                  onPress={handleVoiceInput}
                  disabled={isLoading}
                  style={[
                    styles.micButton,
                    isListening && styles.micButtonActive,
                  ]}
                >
                  <Animated.View
                    style={
                      isListening
                        ? { transform: [{ scale: pulseAnim }] }
                        : undefined
                    }
                  >
                    <Mic
                      size={18}
                      color={isListening ? '#EF4444' : '#9CA3AF'}
                    />
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={isLoading || !input.trim()}
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? '...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Burbuja "Hola!" */}
      {showBubble && !isOpen && (
        <Animated.View style={styles.bubble}>
          <Text style={styles.bubbleText}>¡Hola! ¿Te ayudo con tu compra?</Text>
        </Animated.View>
      )}

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        onPress={toggleChat}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        <Image source={robotAvatar} style={styles.robotImage} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
  robotImage: {
    width: 120,
    height: 120,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#8870C8',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 25,
        }
      : {
          elevation: 12,
        }),
  },
  chatWindow: {
    position: 'absolute',
    bottom: 160,
    right: 16,
    width: Math.min(SCREEN_WIDTH - 32, 360),
    maxHeight: 480,
    backgroundColor: '#2d1b4e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffb800',
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }
      : {
          elevation: 16,
        }),
  },
  header: {
    backgroundColor: '#1e0f35',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    color: '#22C55E',
    fontSize: 11,
  },
  closeButton: {
    padding: 4,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#130726',
  },
  messagesContent: {
    padding: 14,
    gap: 10,
  },
  messageGroup: {
    gap: 6,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffb800',
    borderTopRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d1b4e',
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#5D419D',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#1e0f35',
    fontWeight: '500',
  },
  botMessageText: {
    color: '#FFFFFF',
  },
  cinemaSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 4,
  },
  cinemaButton: {
    backgroundColor: 'rgba(93, 65, 157, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  cinemaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#2d1b4e',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#5D419D',
    alignItems: 'center',
    gap: 2,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1e0f35',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 0, 0.2)',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1b4e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 10,
  },
  micButton: {
    padding: 6,
  },
  micButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: '#ffb800',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#1e0f35',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bubble: {
    position: 'absolute',
    bottom: 155,
    right: 100,
    backgroundColor: '#ffb800',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderTopRightRadius: 0,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }
      : {
          elevation: 6,
        }),
  },
  bubbleText: {
    color: '#1e0f35',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
