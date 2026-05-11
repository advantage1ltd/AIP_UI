from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'src'
TARGET_DIRS = [
	ROOT / 'pages' / 'operations',
	ROOT / 'pages' / 'management',
	ROOT / 'components' / 'operations',
	ROOT / 'components' / 'action-calendar',
	ROOT / 'components' / 'employee-registration',
	ROOT / 'components' / 'customer-setup',
	ROOT / 'components' / 'customer',
	ROOT / 'components' / 'administration',
	ROOT / 'components' / 'dashboard',
]

MARKERS = [
	('export default function', '// === Component ===\n'),
	('export function', '// === Component ===\n'),
	('const ', '// === Component ===\n'),
]


def ensure_sections(path: Path) -> bool:
	text = path.read_text(encoding='utf-8')
	if '// ===' in text:
		return False
	lines = text.splitlines()
	for idx, line in enumerate(lines):
		trim = line.lstrip()
		if trim.startswith('export default function') or trim.startswith('export function'):
			if idx > 0 and lines[idx - 1].startswith('// ==='):
				return False
			lines.insert(idx, '// === Component ===')
			path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
			return True
	return False


def main() -> None:
	changed = 0
	for folder in TARGET_DIRS:
		if not folder.exists():
			continue
		for path in folder.rglob('*.tsx'):
			if ensure_sections(path):
				changed += 1
	print('section banners added', changed)


if __name__ == '__main__':
	main()
