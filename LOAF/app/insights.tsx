import { View, Text } from 'react-native';

export default function InsightsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>Insights</Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Analytics & trends</Text>
    </View>
  );
}
