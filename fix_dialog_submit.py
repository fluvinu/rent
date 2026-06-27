import re

with open('frontend/src/routes/entity.$entityId.tsx', 'r') as f:
    content = f.read()

# Update submit method
def replace_submit(m):
    return """      const payloadParentId = parentRecordId.trim() || undefined;
      if (editRecord && editRecord.id) {
        await api(`/api/records/${editRecord.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...editRecord, data, parentRecordId: payloadParentId }),
        });
        toast.success("Record updated");
      } else {"""
content = re.sub(r'      const payloadParentId = parentRecordId\.trim\(\) \|\| undefined;\s*if \(editRecord\) \{\s*await api\(`/api/records/\$\{editRecord\.id\}`,\s*\{\s*method: "PUT",\s*body: JSON\.stringify\(\{ \.\.\.editRecord, data, parentRecordId: payloadParentId \}\),\s*\}\);\s*toast\.success\("Record updated"\);\s*\} else \{', replace_submit, content)

# Remove fake editRecord from nested RecordDialog
def replace_nested_dialog(m):
    return """      {creatingSubType && (
        <RecordDialog
          open={!!creatingSubType}
          onOpenChange={(val) => { if (!val) setCreatingSubType(null); }}
          type={creatingSubType}
          defaultParentRecordId={editRecord?.id}
          onCreated={() => {
            setCreatingSubType(null);
            reloadSubRecords();
          }}
        />
      )}"""
content = re.sub(r'      \{creatingSubType && \(\s*<RecordDialog\s*open=\{!!creatingSubType\}\s*onOpenChange=\{\(val\) => \{ if \(\!val\) setCreatingSubType\(null\); \}\}\s*type=\{creatingSubType\}\s*editRecord=\{\{\s*id: "",\s*entityTypeId: creatingSubType\.id,\s*parentRecordId: editRecord\?\.id,\s*data: \{\}\s*\}\}\s*defaultParentRecordId=\{editRecord\?\.id\}\s*onCreated=\{\(\) => \{\s*setCreatingSubType\(null\);\s*reloadSubRecords\(\);\s*\}\}\s*/>\s*\)\}', replace_nested_dialog, content)

with open('frontend/src/routes/entity.$entityId.tsx', 'w') as f:
    f.write(content)
