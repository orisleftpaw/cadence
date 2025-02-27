import { env } from '$env/dynamic/private';

const HOST_META = `<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" template="${env.ORIGIN}/.well-known/webfinger?resource={uri}"/>
</XRD>
`;

export function GET() {
	return new Response(HOST_META, { headers: { 'Content-Type': 'application/xml' } });
}
