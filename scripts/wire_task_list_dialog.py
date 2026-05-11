from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'src' / 'components' / 'action-calendar' / 'TaskList.tsx'
lines = p.read_text(encoding='utf-8').splitlines()
start = next(i for i, line in enumerate(lines) if line.strip() == '<Dialog')
end = next(i for i in range(start, len(lines)) if lines[i].strip() == '</Dialog>')
replacement = [
	'      <TaskListEditDialog',
	'        open={isEditDialogOpen}',
	'        selectedTask={selectedTask}',
	'        editedTask={editedTask}',
	'        employees={employees}',
	'        loadingEmployees={loadingEmployees}',
	'        hasAssignableEmployees={hasAssignableEmployees}',
	'        currentAssigneeMissing={currentAssigneeMissing}',
	'        getEmployeeDisplayName={getEmployeeDisplayName}',
	'        onOpenChange={(open) => {',
	'          setIsEditDialogOpen(open)',
	'          if (!open) {',
	'            setSelectedTask(null)',
	'            setEditedTask({})',
	'          }',
	'        }}',
	'        onEditedTaskChange={(patch) => setEditedTask((prev) => ({ ...prev, ...patch }))}',
	'        onSave={handleSaveEdit}',
	'      />',
]
new_lines = lines[:start] + replacement + lines[end + 1:]
text = '\n'.join(new_lines)
for needle in [
	"import { Textarea } from '@/components/ui/textarea'\n",
	"import { Input } from '@/components/ui/input'\n",
	"import { Label } from '@/components/ui/label'\n",
	"import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'\n",
]:
	text = text.replace(needle, '')
text = text.replace(', Loader2', '')
text = text.replace(', parse, isValid', '')
p.write_text(text, encoding='utf-8')
print('TaskList dialog wired')
