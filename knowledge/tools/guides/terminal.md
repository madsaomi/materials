# Продвинутый терминал — Полный конспект

## Введение

Терминал — главный инструмент разработчика. Современный терминал может быть быстрым, красивым и невероятно продуктивным. Разберём zsh, плагины, утилиты, tmux и хаки.

---

## 1. Zsh + Oh My Zsh

### Почему zsh, а не bash

| Критерий | Bash | Zsh |
|----------|------|-----|
| Автодополнение | Базовое | Продвинутое (с подсветкой) |
| Подсказки | Нет | Интерактивные |
| Плагины | Много | Огромная экосистема |
| Темы | Базовые | Красивые (Powerlevel10k) |
| Поддержка | Везде | Почти везде |

### Установка

```bash
# Ubuntu/Debian
sudo apt install zsh

# macOS (обычно уже установлен)
brew install zsh

# Сделать zsh по умолчанию
chsh -s $(which zsh)
```

### Oh My Zsh

```bash
# Установка
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Конфигурация: ~/.zshrc
```

### Полезные плагины

```bash
# В ~/.zshrc
plugins=(
  git                    # git команда → алиасы
  zsh-autosuggestions    # подсказки из истории
  zsh-syntax-highlighting# подсветка синтаксиса
  z                      # быстрый переход по директориям
  fzf                    # нечёткий поиск файлов
  docker                 # docker автодополнения
  kubectl                # kubernetes автодополнения
  python                 # python алиасы
  node                   # node.js алиасы
  extract                # extract任何 archive
  aliases                # алиасы для алиасов
  copypath               # копировать путь
  copyfile               # копировать содержимое файла
  dirhistory             # навигация по истории директорий
  history                # улучшенная история
)
```

### Полезные алиасы

```bash
# В ~/.zshrc или ~/.bashrc

# Навигация
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"

# Git
alias gs="git status"
alias ga="git add"
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline"
alias gd="git diff"
alias gco="git checkout"
alias gb="git branch"

# Безопасность
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"

# Система
alias df="df -h"
alias du="du -h"
alias free="free -m"
alias ports="netstat -tulanp"

# Docker
alias dps="docker ps"
alias dco="docker compose"
alias dlogs="docker logs -f"

# Python
alias py="python3"
alias pip="pip3"
alias venv="python3 -m venv venv && source venv/bin/activate"

# Быстрый доступ
alias kb="cd ~/knowledge"
alias proj="cd ~/projects"
alias dots="cd ~/.config"
```

### Полезные функции

```bash
# Создать директорию и войти в неё
mkcd() { mkdir -p "$1" && cd "$1" }

# Быстрый поиск по истории
h() { history | grep "$1" }

# Извлечь любой архив
extract() {
  if [ -f "$1" ]; then
    case "$1" in
      *.tar.bz2) tar xjf "$1" ;;
      *.tar.gz)  tar xzf "$1" ;;
      *.tar.xz)  tar xJf "$1" ;;
      *.bz2)     bunzip2 "$1" ;;
      *.rar)     unrar x "$1" ;;
      *.gz)      gunzip "$1" ;;
      *.tar)     tar xf "$1" ;;
      *.tbz2)    tar xjf "$1" ;;
      *.tgz)     tar xzf "$1" ;;
      *.zip)     unzip "$1" ;;
      *.Z)       uncompress "$1" ;;
      *.7z)      7z x "$1" ;;
      *)         echo "'$1' cannot be extracted" ;;
    esac
  else
    echo "'$1' is not a valid file"
  fi
}

# Поиск файла по имени
ff() { find . -name "*$1*" }

# Поиск по содержимому
greprr() { grep -rn "$1" . --include="*.py" --include="*.js" --include="*.ts" --include="*.go" }

# Быстрый HTTP-сервер
serve() { python3 -m http.server "${1:-8000}" }

# Git: быстрый коммит и пуш
gpom() { git add . && git commit -m "$1" && git push }
```

---

## 2. Tmux (Terminal Multiplexer)

### Зачем tmux

- Множественные панели в одном окне
- Отключение/подключение к сеансам (detach/reattach)
- Устойчивость к разрывам соединения
- Рабочие пространства для разных проектов

### Основы

```bash
# Создать сеанс
tmux new -s main

# Отключиться (не завершить)
Ctrl+b, d

# Подключиться к существующему
tmux attach -t main

# Список сеансов
tmux ls

# Убить сеанс
tmux kill-session -t main
```

### Управление панелями (Ctrl+b)

| Клавиша | Действие |
|---------|----------|
| `%` | Разделить вертикально |
| `"` | Разделить горизонтально |
| Стрелки | Переключение между панелями |
| `x` | Закрыть панель |
| `z` | Zoom панели (весь экран) |
| `{` / `}` | Переместить панель влево/вправо |
| `Space` | Переключить раскладку панелей |
| `Ctrl+стрелка` | Изменить размер панели |

### Управление окнами

| Клавиша | Действие |
|---------|----------|
| `c` | Новое окно |
| `n` / `p` | Следующее / предыдущее окно |
| `0-9` | Переключиться к окну по номеру |
| `,` | Переименовать окно |
| `&` | Закрыть окно |

### Конфигурация (~/.tmux.conf)

```bash
# Сменить префикс на Ctrl+a (вместо Ctrl+b)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Нумерация панелей с 1 (не 0)
set -g base-index 1
setw -g pane-base-index 1

# Автоматическое перенумерование
set -g renumber-windows on

# Быстрое переключение окон
bind -n M-1 select-window -t 1
bind -n M-2 select-window -t 2
bind -n M-3 select-window -t 3
bind -n M-4 select-window -t 4

# Разделение панелей в текущей директории
bind '"' split-window -h -c "#{pane_current_path}"
bind % split-window -v -c "#{pane_current_path}"

# Навигация панелей через Alt+стрелки (без префикса)
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D

# Увеличить размер прокрутки
set -g history-limit 50000

# Цвета
set -g default-terminal "screen-256color"
```

### Tmux + SSH workflow

```bash
# На сервере:
tmux new -s work

# Отключиться:
# Ctrl+b, d

# Подключиться обратно:
ssh user@server
tmux attach -t work

# Или сразу:
ssh -t user@server tmux attach -t work
```

### Плагин TPM (Tmux Plugin Manager)

```bash
# Установка
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# В ~/.tmux.conf:
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'  # сохранение сеансов
set -g @plugin 'tmux-plugins/tmux-continuum'  # автосохранение
set -g @plugin 'tmux-plugins/tmux-yank'       # копирование в буфер

# Инициализация
# Затем: Ctrl+b, I (установить плагины)
```

---

## 3. Современные CLI-утилиты

### fzf (Fuzzy Finder)

```bash
# Установка
brew install fzf  # macOS
apt install fzf   # Ubuntu

# Использование
# Ctrl+T — поиск файла
# Ctrl+R — поиск по истории
# Alt+C  — cd с нечётким поиском

# В скриптах
find . -type f | fzf --preview 'cat {}'

# Git: выбор ветки
git branch | fzf | xargs git checkout

# Выбор процесса для убийства
ps aux | fzf | awk '{print $2}' | xargs kill
```

### ripgrep (rg)

```bash
# Быстрый поиск по содержимому (замена grep)
rg "pattern"                     # поиск по файлам
rg "pattern" --type py           # только Python файлы
rg "pattern" -i                  # без учёта регистра
rg "pattern" -l                  # только имена файлов
rg "pattern" -c                  # количество совпадений
rg "pattern" --glob '!*.min.js'  # исключить minified JS
rg "pattern" -A 3 -B 3          # контекст (3 строки до/после)
```

### fd

```bash
# Быстрый поиск файлов (замена find)
fd ".py"                  # найти все .py файлы
fd "test" -e py           # файлы test*.py
fd -H .gitignore          # включая скрытые файлы
fd -E node_modules        # исключая node_modules
fd -t f                   # только файлы
fd -t d                   # только директории
fd -s "MyFile"            # без учёта регистра
```

### bat

```bash
# cat с подсветкой синтаксиса
bat file.py               # показать файл с подсветкой
bat --line-range 10:20 file.py  # конкретные строки
bat -l yaml docker-compose.yml  # указать язык
bat --diff file1 file2    # показать разницу
```

### exa / eza

```bash
# Современная замена ls
exa                        # цветной вывод
exa -l                     # длинный формат
exa -la                    # все файлы + скрытые
exa --tree -L 2            # дерево (2 уровня)
exa --tree --git-ignore    # дерево с git-игнором
exa -l --icons             # с иконками

# eza (форк exa)
eza --tree -L 3 --icons
```

### delta

```bash
# Красивый diff для git
# В ~/.gitconfig:
[core]
  pager = delta

[interactive]
  diffFilter = delta --color-only

[delta]
  navigate = true
  syntax-theme = Dracula
  line-numbers = true
  side-by-side = true
```

### zoxide (замена cd)

```bash
# Установка
brew install zoxide

# Использование
z projects          # cd в директорию, содержащую "projects"
z knowledge         # cd в ближайшую matching директорию
zi                  # интерактивный выбор

# В ~/.zshrc:
eval "$(zoxide init zsh)"
# Теперь 'z' вместо 'cd'
```

### starship (промпт)

```bash
# Установка
brew install starship  # macOS
curl -sS https://starship.rs/install.sh | sh

# В ~/.zshrc (последняя строка):
eval "$(starship init zsh)"
```

**Конфигурация (~/.config/starship.toml):**

```toml
format = """
$username\
$hostname\
$directory\
$git_branch\
$git_status\
$nodejs\
$python\
$cmd_duration\
$line_break\
$character"""

[directory]
truncation_length = 3

[git_branch]
symbol = " "

[cmd_duration]
min_time = 2_000
format = "took $duration"

[nodejs]
symbol = " "

[python]
symbol = " "
```

### atuin (история shell)

```bash
# Установка
brew install atuin

# В ~/.zshrc:
eval "$(atuin init zsh)"

# Использование:
# Ctrl+R — интерактивный поиск по истории
# atuin search "docker" — поиск по команде
# atuin stats — статистика
```

---

## 4. Полезные bash-хаки

### Продвинутый поиск

```bash
# Поиск по содержимому всех файлов в директории
grep -rn "pattern" /path/to/dir --include="*.py" --include="*.js"

# Поиск файлов, изменённых за последние N дней
find . -type f -mtime -7

# Поиск больших файлов
find . -type f -size +100M

# Поиск пустых файлов
find . -type f -empty
```

### Работа с процессами

```bash
# Найти процесс по имени
ps aux | grep "python"

# Убить процесс по порту
lsof -ti:8080 | xargs kill -9

# Мониторинг в реальном времени
top -o %CPU
htop  # лучше
```

### Сетевые утилиты

```bash
# Проверка порта
nc -zv localhost 8080

# Скачивание файлов
wget https://example.com/file.zip
curl -O https://example.com/file.zip

# DNS
dig example.com
nslookup example.com

# Сетевая статистика
netstat -tulanp
ss -tulanp  # современная замена
```

### Скрипты

```bash
# Быстрый бэкап
backup() {
  tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" "$1"
}

# Массовое переименование
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# Подсчёт строк кода
find . -name "*.py" | xargs wc -l | tail -1
```

---

## 5. Производительность терминала

### Оптимизации

```bash
# Отключить проверку при каждой команде (zsh)
DISABLE_UPDATE_PROMPT=true

# Кэширование команд
zstyle -e ':completion_complete' list-colors 'reply=("${(@s.:.)LS_COLORS}")'

# История
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
```

### Инструменты для профилирования

```bash
# Замер времени выполнения команд
time zsh -i -c exit

# Bash profiling
PROFILE_BASH=1 bash -i -c exit
```

---

## 6. Рекомендуемый стек

| Компонент | Инструмент |
|-----------|-----------|
| Оболочка | Zsh |
| Фреймворк | Oh My Zsh |
| Промпт | Starship |
| Поиск файлов | fd + fzf |
| Поиск по содержимому | ripgrep |
| Просмотр файлов | bat |
| ls замена | eza |
| cd замена | zoxide |
| История | atuin |
| Diff | delta |
| Мультиплексор | tmux |

---

*Полный конспект продвинутого терминала. Дополняется по мере изучения.*
