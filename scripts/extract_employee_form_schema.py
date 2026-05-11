from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'src' / 'components' / 'employee-registration'
src_path = root / 'EmployeeForm.tsx'
lines = src_path.read_text(encoding='utf-8').splitlines()
start = next(i for i, line in enumerate(lines) if line.strip().startswith('const formSchema = '))
end = next(i for i in range(start, len(lines)) if lines[i].strip() == '})' and 'z.object' in '\n'.join(lines[start:i + 1]))
schema_block = '\n'.join(lines[start:end + 1]).replace('const formSchema', 'export const employeeFormSchema', 1)
out = root / 'employeeFormSchema.ts'
out.write_text(
	'/** Zod schema for employee registration and edit. */\n'
	"import * as z from 'zod'\n\n"
	+ schema_block
	+ '\n\nexport type EmployeeFormValues = z.infer<typeof employeeFormSchema>\n',
	encoding='utf-8',
)
new_lines = lines[:start] + [
	"import { employeeFormSchema, type EmployeeFormValues } from './employeeFormSchema'",
] + lines[end + 1:]
text = '\n'.join(new_lines)
text = text.replace('type FormData = z.infer<typeof formSchema>', 'type FormData = EmployeeFormValues')
text = text.replace('zodResolver(formSchema)', 'zodResolver(employeeFormSchema)')
text = text.replace('formSchema', 'employeeFormSchema')
src_path.write_text(text, encoding='utf-8')
print('EmployeeForm schema extracted')
