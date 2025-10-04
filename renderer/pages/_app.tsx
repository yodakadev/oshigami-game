import { ChakraProvider } from '@chakra-ui/react'
import { Global, css } from '@emotion/react'

import theme from '../lib/theme'
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Global
        styles={css`
          @font-face {
            font-family: 'Misaki Gothic';
            src: url('/fonts/misaki_gothic.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          * {
            font-family: 'Misaki Gothic', sans-serif !important;
          }
        `}
      />
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
