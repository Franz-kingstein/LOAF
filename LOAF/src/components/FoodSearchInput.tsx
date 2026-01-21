import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../context/ThemeContext';
import { Food, loadFoodDataAsync } from '../data/loadFoodData';
import { searchFoodDictionary } from '../services/foodMatcher';

interface FoodSearchInputProps {
  onSelect: (food: Food) => void;
}

export function FoodSearchInput({ onSelect }: FoodSearchInputProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Food[]>([]);

  React.useEffect(() => {
    // Background refresh food data to include new custom foods
    loadFoodDataAsync();
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 1) {
      // Ensure we have latest data
      await loadFoodDataAsync();
      const filtered = searchFoodDictionary(text);
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (food: Food) => {
    setQuery('');
    setResults([]);
    onSelect(food);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search food by name or alias..."
        placeholderTextColor={COLORS.textTertiary}
        value={query}
        onChangeText={handleSearch}
      />
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <View>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCategory}>{item.category}</Text>
              </View>
              {item.confidence > 0.9 && (
                <Text style={styles.verifiedTag}>Verified</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.textPrimary,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  verifiedTag: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
