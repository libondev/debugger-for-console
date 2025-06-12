/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// @ts-nocheck

import { StyleSheet, View } from 'react-native'

import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import Button from '@/components/Button'
import ImageViewer from '@/components/ImageViewer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
})

const obj = {
  a: 1,
  b: 2,
} satisfies Record<string, any>

const obj2 = {
  a: 1,
  b: 2,
} as Record<string, any>

const props = defineProps<{
  data: any;
}>();

const props = defineProps<{
  abc: number;
  data: Array<{
    id: string;
    [key: string]: any;
  }>;
  zyx: number;
}>()

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string>()

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    })

    if (result.canceled) {
      alert('You did not select any image.')
    } else {
      setSelectedImage(result.assets[0].uri)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>

      <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
        <Button label="Use this photo" />
      </View>
    </View>
  )
}
