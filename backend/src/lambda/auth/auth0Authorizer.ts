import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'



const logger = createLogger('auth');
const jwksUrl = 'https://dev-4mqcrvok.us.auth0.com/.well-known/jwks.json';

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // TODO: Implement token verification
  
  const response = await Axios.get(jwksUrl);
  const jwkset = response['data'] 
  const keys = jwkset['keys'] 

  // Extract the JWT from the request's authorization header.
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // Decode JWT and grab the kid property from the header.
  const jwtKid = jwt.header.kid 
  logger.info(`JWT Kid : ${jwtKid}`)

  // Find the _signature verification_ (use=sig) key in the filtered JWKS with a matching kid property.
  const signingKey = keys
    .filter(key => key.use === 'sig' 
      && key.kty === 'RSA' 
      && key.kid === jwtKid
      && ((key.x5c && key.x5c.length) || (key.n && key.e)) 
    ).map(key => {
  
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) }; // Using the x5c property build a certificate which will be used to verify the JWT signature.
    });

  // If at least one signing key doesn't exist we have a problem... Kaboom.
  if (!signingKey.length) {
    throw new Error(`The JWKS endpoint did not contain any signature verification key matching kid = ${jwtKid}`)
  }

  return verify(token, signingKey[0].publicKey, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}