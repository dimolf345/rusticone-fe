export function itemTrackBy(item: unknown, index: number): string | number {
  const it = item as Record<string, unknown> | null | undefined;
  return (
    (it?.['id'] as string | number) ??
    (it?.['_id'] as string | number) ??
    (it?.['title'] as string) ??
    (it?.['name'] as string) ??
    index
  );
}
