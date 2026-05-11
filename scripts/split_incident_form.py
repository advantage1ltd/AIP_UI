from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'src' / 'components' / 'operations'
src_path = root / 'IncidentForm.tsx'
lines = src_path.read_text(encoding='utf-8').splitlines()
out = root / 'incident-form'
out.mkdir(exist_ok=True)

schema = '\n'.join(lines[42:110])
constants = '\n'.join(lines[111:210])
utils = '\n'.join(lines[211:239])

(out / 'incidentFormSchema.ts').write_text(
	'/** Zod schema for operations incident report form. */\n'
	"import * as z from 'zod'\n\n"
	'export const incidentFormSchema = ' + schema.replace('const formSchema = ', '', 1) + '\n\n'
	'export type IncidentFormValues = z.infer<typeof incidentFormSchema>\n',
	encoding='utf-8',
)
(out / 'incidentFormConstants.ts').write_text(
	'/** Static option lists for IncidentForm selects. */\n'
	"import { IncidentType, IncidentInvolved } from '@/types/incidents'\n\n"
	+ constants
	+ '\n',
	encoding='utf-8',
)
(out / 'incidentFormStolenItems.ts').write_text(
	'/** Stolen-line recovery calculations for IncidentForm. */\n'
	"import type { StolenItem } from '@/types/incidents'\n\n"
	+ utils
	+ '\n',
	encoding='utf-8',
)

head = '\n'.join(lines[:42])
new_imports = (
	"\nimport { incidentFormSchema } from './incident-form/incidentFormSchema'\n"
	"import {\n"
	"\tINCIDENT_OFFICER_ROLE_OPTIONS,\n"
	"\tincidentTypes,\n"
	"\tverificationMethods,\n"
	"\tincidentInvolved,\n"
	"\tretailCategories,\n"
	"\tformatDateSafe,\n"
	"\tformatDateForNativeInput,\n"
	"} from './incident-form/incidentFormConstants'\n"
	"import { hydrateStolenItems } from './incident-form/incidentFormStolenItems'\n"
	"import { logger } from '@/utils/logger'\n"
)
tail = '\n'.join(lines[239:])
tail = tail.replace('formSchema', 'incidentFormSchema')
tail = tail.replace("console.log('📝 Form initializing with incident:", "logger.debug('[IncidentForm] initializing incident:")
new_src = (
	'/**\n'
	' * Operations incident create/edit form; submits through incidentService.\n'
	' */\n'
	+ head
	+ new_imports
	+ '\n'
	+ tail
)
src_path.write_text(new_src, encoding='utf-8')
print('IncidentForm split complete', len(new_src.splitlines()), 'lines')
