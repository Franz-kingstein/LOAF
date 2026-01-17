import { View, Text } from 'react-native';

export default function LogFoodScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>Log Food</Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Add meals here</Text>
    </View>
  );
}
