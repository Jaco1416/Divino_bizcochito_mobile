import { View, Text } from 'react-native'
import Navbar from '../../components/Navbar/Navbar'
import Carousel from '../../components/Carousel/Carouse'

// Importar las imágenes del carousel
const pastelCarousel1 = require('../../assets/pastel_carousel_1.png');
const pastelCarousel2 = require('../../assets/pastel_carousel_2.png');
const pastelCarousel3 = require('../../assets/pastel_carousel_3.png');
const pastelCarousel4 = require('../../assets/pastel_carousel_4.png');

function home() {
  const carouselImages = [
    pastelCarousel1,
    pastelCarousel2,
    pastelCarousel3,
    pastelCarousel4,
  ];

  return (
    <View className="flex-1 bg-white">
      <Navbar />
      <Carousel images={carouselImages} />
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-800 text-lg">Home Screen</Text>
      </View>
    </View>
  )
}

export default home