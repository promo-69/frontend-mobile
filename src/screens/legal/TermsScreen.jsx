import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { theme } from '../../constants';

const CLAUSES = [
  {
    title: 'PRIMERA: OBJETO',
    text: 'Regular las condiciones para la consulta de cartelera, compra de boletos, adquisición de productos de confitería, gestión de cuentas y participación en programas de fidelización (CinePuntos).',
  },
  {
    title: 'SEGUNDA: REGISTRO DEL USUARIO',
    text: 'Para acceder a los servicios, EL USUARIO deberá crear una cuenta proporcionando información veraz y completa, incluyendo: Nombre y Apellido, Cédula de Identidad (V o E), Correo Electrónico, Número de Teléfono, Fecha de Nacimiento y Contraseña de acceso.',
  },
  {
    title: 'TERCERA: FINALIDAD Y TRATAMIENTO DE DATOS',
    text: 'Los datos personales serán recopilados y tratados con el fin de procesar transacciones de compra, validar la identidad para prevención de fraudes, gestionar reservas, facturación, administrar el programa de beneficios y cumplir con las regulaciones de la República Bolivariana de Venezuela.',
  },
  {
    title: 'CUARTA: CONDICIONES DE COMPRA',
    text: 'Las operaciones se expresarán en Bolívares (Bs.) o moneda extranjera vigente. Toda compra generará un comprobante digital (código QR o de reserva) válido únicamente para la función, fecha y hora seleccionadas, incluyendo los impuestos de ley.',
  },
  {
    title: 'QUINTA: POLÍTICA DE CANCELACIÓN Y REEMBOLSO',
    text: 'Las compras realizadas a través del portal son definitivas. No se realizan cambios ni devoluciones de dinero, salvo por cancelación de la función por parte de CINEFLIX, fallas técnicas atribuibles a la plataforma o situaciones comprobadas de fuerza mayor.',
  },
  {
    title: 'SEXTA: CLASIFICACIÓN Y ADMISIÓN',
    text: 'CINEFLIX se reserva el derecho de admisión de acuerdo con las clasificaciones por edad estipuladas por las autoridades competentes. Es responsabilidad del usuario verificar la clasificación antes de comprar; su incumplimiento no generará reembolsos.',
  },
  {
    title: 'SÉPTIMA: USO DEL PORTAL Y PROPIEDAD INTELECTUAL',
    text: 'Queda prohibida la reproducción total o parcial del diseño, estructura, código fuente, marcas y logotipos propiedad exclusiva de CINEFLIX. El uso indebido o actividades fraudulentas acarrearán la suspensión inmediata de la cuenta.',
  },
];

export default function TermsScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <AppText variant="h2" style={styles.mainTitle}>
            Contrato de Términos y{'\n'}Condiciones de Uso
          </AppText>
          <AppText variant="caption" style={styles.subtitle}>
            Portal Web Oficial de Cineflix, C.A.
          </AppText>
        </View>

        <View style={styles.divider} />

        <AppText variant="body" style={styles.introText}>
          El presente contrato regula las disposiciones de acceso, navegación
          y uso del portal entre la sociedad mercantil CINEFLIX, C.A. y EL
          USUARIO. El acceso o registro implica la aceptación plena de estas
          cláusulas.
        </AppText>

        {CLAUSES.map((clause, index) => (
          <View key={index} style={styles.clauseContainer}>
            <AppText variant="smallText" style={styles.clauseTitle}>
              {clause.title}
            </AppText>
            <AppText variant="body" style={styles.clauseText}>
              {clause.text}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.s24,
    paddingTop: theme.spacing.s16,
    paddingBottom: theme.spacing.s32,
  },
  headerBlock: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingLeft: theme.spacing.s16,
    marginBottom: theme.spacing.s20,
  },
  mainTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.s4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: theme.spacing.s20,
  },
  introText: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: theme.spacing.s24,
  },
  clauseContainer: {
    marginBottom: theme.spacing.s24,
    paddingBottom: theme.spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  clauseTitle: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.s12,
  },
  clauseText: {
    color: theme.colors.textSecondary,
    lineHeight: 24,
    opacity: 0.8,
  },
});
