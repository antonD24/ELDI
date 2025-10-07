import { Amplify } from 'aws-amplify';
import Constants from 'expo-constants';

const DEFAULT_URL =
  'https://eldi-web-amplify-config.s3.eu-west-3.amazonaws.com/config/prod/amplify_outputs.json';

function getConfigUrl() {
  const extras = Constants.expoConfig?.extra as Record<string, any> | undefined;
  return extras?.AMPLIFY_CONFIG_URL ?? DEFAULT_URL;
}


export async function configureAmplify() {
  const url = getConfigUrl();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch amplify_outputs.json: ${res.status} ${res.statusText}`);
  }

  const cfg = await res.json();
  Amplify.configure(cfg);
  console.log('Amplify configured from:', url);
}