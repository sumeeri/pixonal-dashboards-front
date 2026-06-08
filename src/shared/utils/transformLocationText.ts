export function transformLocationText(name: string): string {
  switch (name) {
    case 'CBD':
      return name;
    default:
      return name?.toLowerCase();
  }
}
