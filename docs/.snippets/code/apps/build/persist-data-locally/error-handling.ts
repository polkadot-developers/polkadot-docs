try {
  await store.set('key', 'value');
} catch (error) {
  console.error('Failed to write to store:', (error as Error).message);
}
