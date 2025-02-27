import {
	createHash,
	createPublicKey,
	createVerify,
	generateKeyPair,
	KeyObject,
	createSign,
	createPrivateKey
} from 'node:crypto';
import { parseDictionary, serializeDictionary, type Item } from 'structured-headers';
import { apfetch } from './fetch';
import { db } from '../db';
import { keys } from '../db/schema';
import { eq } from 'drizzle-orm';
import { USER_AGENT } from '$lib/config';

export async function sign(url: string, keyId: string, init: RequestInit) {
	const [key] = await db.select().from(keys).where(eq(keys.id, keyId));
	if (!key || !key.private) throw new Error('Unable to find private key!');

	const request = new Request(url, init);
	const clone = request.clone();
	const parsedUrl = new URL(request.url);
	const body = Buffer.from(await clone.arrayBuffer());

	request.headers.set('date', new Date().toUTCString());
	request.headers.set('user-agent', USER_AGENT);

	if (body.length) {
		const hash = createHash('sha256');
		hash.update(Buffer.from(body));
		request.headers.set('digest', hash.digest().toString('base64'));
	}

	let hashtext = '';
	hashtext += `(request-target): ${request.method.toLocaleLowerCase()} ${parsedUrl.pathname}\n`;
	hashtext += `host: ${parsedUrl.host}\n`;
	hashtext += `date: ${request.headers.get('date')}\n`;
	hashtext += `user-agent: ${request.headers.get('user-agent')}\n`;
	if (body.length) hashtext += `digest: ${request.headers.get('digest')}\n`;
	if (body.length) hashtext += `content-type: ${request.headers.get('content-type')}\n`;
	hashtext = hashtext.trim();

	const headers = hashtext
		.split('\n')
		.map((_) => _.split(':')[0])
		.join(' ');

	const sign = createSign('rsa-sha256');
	sign.write(hashtext);
	sign.end();
	const signature = sign.sign(createPrivateKey(key.private)).toString('base64');

	const dictionary = serializeDictionary({
		keyid: keyId,
		algorithm: 'rsa-sha256',
		headers,
		signature
	});

	request.headers.set('signature', dictionary.replace('keyid', 'keyId').replaceAll(', ', ','));

	return request;
}

// todo: cache public keys!
export async function findPublicKey({ keyId }: { keyId: string }) {
	const response = await apfetch({ url: keyId });
	const body = await response.json();
	const publicKey = body.publicKey;
	if (!publicKey || !publicKey.publicKeyPem) return false;

	return publicKey.publicKeyPem;
}

export async function verify({ request, body }: { request: Request; body: ArrayBuffer }) {
	const signatureHeader = request.headers.get('signature');
	const signatureInputHeader = request.headers.get('signature-input');
	const digestHeader = request.headers.get('digest');
	if ((!signatureHeader && !signatureInputHeader) || !digestHeader) return false;

	try {
		const url = new URL(request.url);

		if (signatureHeader && signatureInputHeader) {
			// RFC 9421
		} else if (signatureHeader && !signatureInputHeader) {
			// draft-cavage-http-signatures-12

			const digest = digestHeader.substring(digestHeader.indexOf('=') + 1);
			const hash = createHash('sha256');
			hash.update(Buffer.from(body));
			const calculatedDigest = hash.digest().toString('base64');

			if (calculatedDigest !== digest) return false;

			const data = parseDictionary(signatureHeader.replaceAll('keyId', 'keyid'));
			const [keyId] = data.get('keyid') as Item;
			const [algorithm] = data.get('algorithm') as Item;
			const [headers] = data.get('headers') as Item;
			const [signature] = data.get('signature') as Item;

			console.log(headers);

			let hashtext = '';
			for (let header of headers.toString().split(' ')) {
				if (header === '(request-target)') {
					hashtext += `(request-target): ${request.method.toLocaleLowerCase()} ${url.pathname}\n`;
					continue;
				}

				hashtext += `${header}: ${request.headers.get(header)}\n`;
			}
			hashtext = hashtext.trim();

			const publicKeyPem = await findPublicKey({ keyId: keyId as string });
			if (!publicKeyPem) return false;

			const publicKey = createPublicKey(publicKeyPem);
			const verify = createVerify(algorithm as string);
			verify.write(hashtext);
			verify.end();

			return verify.verify(publicKey, signature as string, 'base64');
		}
	} catch (_) {
		console.log(_);
		return false;
	}

	return false;
}

export function generateKeypair(): Promise<{ publicKey: KeyObject; privateKey: KeyObject }> {
	return new Promise((resolve, reject) => {
		generateKeyPair('rsa', { modulusLength: 2048 }, (err, publicKey, privateKey) => {
			if (err) return reject(err);
			resolve({ publicKey, privateKey });
		});
	});
}
