import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../constants'

export default function SectionHeader({ title, onSeeMore }) {
  return (
    <View style={styles.container}>
      <MaskedView maskElement={<Text style={styles.title}>{title}</Text>}>
        <LinearGradient
          colors={[theme.colors.textAccent.gold || '#FFD54A', '#F4B400']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingVertical: theme.spacing.s4 / 2 }}
        >
          <Text style={[styles.title, { opacity: 0 }]}>{title}</Text>
        </LinearGradient>
      </MaskedView>
      {onSeeMore ? (
        <TouchableOpacity style={styles.pill} onPress={onSeeMore}>
          <Text style={styles.pillText}>Ver más</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s16,
    marginTop: theme.spacing.s16,
    marginBottom: theme.spacing.s12,
  },
  title: {
    fontSize: theme.typography.size.s16,
    fontFamily: theme.typography.family.primary.bold,
    color: theme.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pill: {
    backgroundColor: theme.colors.textAccent.gold,
    paddingVertical: theme.spacing.s8,
    paddingHorizontal: theme.spacing.s12,
    borderRadius: theme.borderRadius.s16,
    shadowColor: theme.colors.textAccent.gold,
    shadowOpacity: 0.12,
    elevation: 2,
  },
  pillText: {
    color: theme.colors.textBlack,
    fontSize: theme.typography.size.s12,
    fontFamily: theme.typography.family.primary.bold,
  },
})
