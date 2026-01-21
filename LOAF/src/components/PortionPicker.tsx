import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../context/ThemeContext';

interface PortionOption {
  label: string;
  grams: number;
}

interface PortionPickerProps {
  options: PortionOption[];
  selectedLabel: string;
  onSelect: (option: PortionOption) => void;
}

export function PortionPicker({ options, selectedLabel, onSelect }: PortionPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Portion (Indian Units)</Text>
      <View style={styles.grid}>
        {options.map((item) => {
          const isSelected = item.label === selectedLabel;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.option,
                isSelected && styles.optionSelected
              ]}
              onPress={() => onSelect(item)}
            >
              <Text style={[
                styles.label,
                isSelected && styles.labelSelected
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.grams,
                isSelected && styles.gramsSelected
              ]}>
                {item.grams}g
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  labelSelected: {
    fontWeight: 'bold',
  },
  grams: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  gramsSelected: {
    color: COLORS.textPrimary,
  },
});
