export function checkGetHeaders(request: Request) {
	const accept = request.headers.get('Accept');
	if (!accept) return false;

	if (accept.startsWith('application/activity+json')) return true;
	if (accept.startsWith('application/ld+json')) return true;

	return false;
}

export function checkPostHeaders(request: Request) {
	const contentType = request.headers.get('Content-Type');
	if (!contentType) return false;

	if (contentType.startsWith('application/activity+json')) return true;
	if (contentType.startsWith('application/ld+json')) return true;

	return false;
}
