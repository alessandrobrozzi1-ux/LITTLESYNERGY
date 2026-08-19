/**
 * IndexNow — ping istantaneo "questa URL e' nuova/aggiornata" a Bing, Yandex e agli altri
 * consumatori IndexNow. Una chiave per host, pubblicata come file di testo alla radice del sito
 * (ospitato dal frontend):  https://<host>/<INDEXNOW_KEY>.txt   (contenuto = la chiave stessa).
 * No-op silenzioso se INDEXNOW_KEY non e' configurata.
 *
 * 🚨 QUI NON VIVE NESSUNA LOGICA DI URL. L'indirizzo pubblico si costruisce con `publicUrl` di
 * lib/weave-links, che e' l'unica fonte di verita' gia' allineata al sito VIVO di QUESTO brand
 * (i percorsi /blog e le lingue differiscono da brand a brand: duplicare la regola qui e' la
 * trappola del "motore copiato" che il 17 ago 2026 produsse canonical e ping verso dei 404).
 */

/** Ping IndexNow per una URL. true su 200/202. Best-effort, timeout corto, non lancia mai. */
export async function pingIndexNow(articleUrl: string | null | undefined): Promise<boolean> {
  const key = process.env.INDEXNOW_KEY
  if (!key || !articleUrl) return false
  try {
    const host = new URL(articleUrl).host
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: [articleUrl] }),
      signal: AbortSignal.timeout(4000),
    })
    return res.ok
  } catch {
    return false
  }
}
