# SYSTEM SNAPSHOT INDEX

Lista di tutti gli snapshot del sistema. Aggiungere una riga per ogni snapshot futuro.

| Data | File | Versione | Evento |
|---|---|---|---|
| 2026-06-25 | [SYSTEM_SNAPSHOT_2026-06-25.md](./SYSTEM_SNAPSHOT_2026-06-25.md) | v2.0 | Sistema 3 lingue (EN+ES+DE) in autopilot validato — primo cron automatico confermato |
| 2026-06-26 | [SYSTEM_SNAPSHOT_2026-06-26_5lang_brand_locked.md](./SYSTEM_SNAPSHOT_2026-06-26_5lang_brand_locked.md) | v3.2 | 5 lingue autopilot (EN+ES+DE+FR+PT) + Image Brand Identity locked (doTERRA-branded) + GEO prompt + Vercel 60s cap |

---

## Come usare questo index

1. **Rollback**: apri il file snapshot della data precedente alla regressione → segui la sezione "ROLLBACK PROCEDURE"
2. **Confronto stato**: diff tra due snapshot per capire cosa è cambiato
3. **Onboarding**: il snapshot più recente = stato attuale del sistema

## Quando creare un nuovo snapshot

- Dopo lancio di ogni nuova lingua
- Dopo implementazione feature major (internal linking, backlink system, ecc.)
- Prima di ogni refactoring significativo
- Dopo ogni bug critico risolto

Comando creazione snapshot:
```
Crea snapshot SYSTEM_SNAPSHOT_[YYYY-MM-DD].md con stato attuale sistema
```
