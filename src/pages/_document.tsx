import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link
            href="/fonts/Poppins/poppins-v15-latin-100.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-100italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-200.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-200italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            rel="preload" // hint text on login page
            href="/fonts/Poppins/poppins-v15-latin-300.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-300italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            rel="preload" // default text and title in the app bar
            href="/fonts/Poppins/poppins-v15-latin-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            rel="preload" // login page title and buttons
            href="/fonts/Poppins/poppins-v15-latin-500.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-500italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-600.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-600italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-700.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-700italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-800.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-800italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-900.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Poppins/poppins-v15-latin-900italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            rel="preload" // load all the "body" text immediately
            href="/fonts/Work_Sans/work-sans-variableFont_wght-subset.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            href="/fonts/Work_Sans/work-sans-italic-variableFont_wght-subset.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
