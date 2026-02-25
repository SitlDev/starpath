import os

file_path = '/Users/amn/Documents/GitHub/Claude/BlogGenerator/webapp/dist/assets/index-StqRa_D9.js'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the full list
old_list = '["movies","tv","music","celebrity","awards","streaming","books","gaming","local"]'
new_list = '["movies","tv","music","celebrity","awards","streaming","books","gaming","local","tech","finance","health","lifestyle","science","sports"]'
content = content.replace(old_list, new_list)

# Also replace the smaller list if needed, or just let the full list be the primary one.
# In the dd output I saw: ["movies","tv","music","celebrity","awards","streaming","books","gaming"]
# Wait, "local" might have been missing or at the end. Let's check the dd output again.
# "children:["movies","tv","music","celebrity","awards","streaming","books","gaming"].map"
# Ah, "local" was missing in that specific spot? Let's verify.

with open(file_path, 'w') as f:
    f.write(content)

print("Replacement complete")
