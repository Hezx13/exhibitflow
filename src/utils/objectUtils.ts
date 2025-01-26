// Generate a MongoDB-style ObjectId
function generateObjectId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(12));
    return timestamp + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }
  
