import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ImageSourcePropType } from 'react-native';

interface CarouselProps {
  images: (string | ImageSourcePropType)[];
  height?: number;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Carousel({ images, height = 250, autoPlayInterval = 3000 }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoPlayInterval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  };

  return (
    <View className="w-full">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="w-full"
      >
        {images.map((image, index) => (
          <View key={index} style={{ width: screenWidth, height }}>
            <Image
              source={typeof image === 'string' ? { uri: image } : image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Indicadores de puntos */}
      <View className="absolute bottom-4 w-full flex-row justify-center items-center">
        {images.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === activeIndex ? 'bg-bizcochito-red' : 'bg-white/50'
            }`}
          />
        ))}
      </View>
    </View>
  );
}