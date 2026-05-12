#!/bin/bash

# Function to add Sidebar to a page
add_sidebar_to_page() {
    local filepath=$1
    local import_after=$2
    
    # Add Sidebar import
    sed -i "" "/${import_after//\//\\/}/a\\
import Sidebar from '@/components/Sidebar';" "$filepath"
    
    # Replace opening wrapper (old structure)
    sed -i "" "s/<div className=\"min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-8\">/<div className=\"flex h-screen bg-slate-900\">/" "$filepath"
    sed -i "" "/<div className=\"flex h-screen bg-slate-900\">/{
        n
        s/^      <div className=\"max-w-7xl mx-auto\">/      <Sidebar user={user} \/>\n      <main className=\"flex-1 overflow-auto\">\n        <div className=\"p-8\">\n          <div className=\"max-w-7xl mx-auto\">/
    }" "$filepath"
    
    echo "Applied Sidebar to $filepath"
}

# Apply to each file
add_sidebar_to_page "app/dashboard/health/page.tsx" "import { mockInspections, mockFacilities }"
add_sidebar_to_page "app/dashboard/quality/page.tsx" "import { mockQualityMeasures }"
add_sidebar_to_page "app/dashboard/alerts/page.tsx" "import { mockAlerts }"
add_sidebar_to_page "app/dashboard/cms/page.tsx" "import { API_URL }"
add_sidebar_to_page "app/dashboard/staffing/page.tsx" "import { mockStaffing }"
