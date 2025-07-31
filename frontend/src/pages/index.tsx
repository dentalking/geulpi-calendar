import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Geulpi Calendar</title>
        <meta name="description" content="AI-powered calendar application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Welcome to Geulpi Calendar</h1>
        <p>AI-powered calendar application</p>
      </main>
    </>
  );
}