# A skill `analisar-campeonato` — cópia versionada

**A cópia que roda mora em `~/.claude/skills/analisar-campeonato/`**, que é onde o Claude Code
procura skills. Esta pasta aqui é só o backup no repositório, porque a pasta de skills não é
versionada e este material é o mais caro do estudo: ele existe porque a sessão apanhou.

**Ao mexer na skill, sincronize as duas** — senão elas divergem e ninguém sabe qual vale:

```bash
cp -R ~/.claude/skills/analisar-campeonato/. _fonte/estudo_serieb/skill/
```

E para reinstalar do repositório numa máquina nova:

```bash
mkdir -p ~/.claude/skills/analisar-campeonato
cp -R _fonte/estudo_serieb/skill/. ~/.claude/skills/analisar-campeonato/
rm ~/.claude/skills/analisar-campeonato/LEIA.md
```
