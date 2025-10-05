// Demo file to test shared components - can be deleted after verification
'use client'

import * as React from 'react'
import {
  ListItemCard,
  ResponsiveGrid,
  EmptyState,
  LoadingState,
  SkeletonGrid,
  NoTeachersState,
  NoStudentsState,
  type TeacherListItem,
  type StudentListItem,
  type ListItemActions
} from './index'

// Sample data
const sampleTeacher: TeacherListItem = {
  id: '1',
  name: 'Dr. Sarah Ahmed',
  email: 'sarah.ahmed@university.edu',
  phone: '+1 (555) 123-4567',
  status: 'Active',
  department: 'Computer Science',
  qualification: 'PhD in Computer Science',
  experience: '10 years',
  classes: 5
}

const sampleStudent: StudentListItem = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@student.edu',
  phone: '+1 (555) 987-6543',
  status: 'Active',
  program: 'Computer Science',
  year: '2nd Year',
  semester: '4th Semester',
  gpa: '3.8',
  attendance: '85'
}

const sampleActions: ListItemActions = {
  onEdit: (id) => console.log('Edit:', id),
  onDelete: (id) => console.log('Delete:', id),
  onView: (id) => console.log('View:', id)
}

export function SharedComponentsDemo() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900">Shared Components Demo</h1>
      
      {/* ListItemCard Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">ListItemCard</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Teacher Card (Orange Theme)</h3>
          <ListItemCard
            item={sampleTeacher}
            colorScheme="orange"
            actions={sampleActions}
            className="max-w-md"
          />
          
          <h3 className="text-lg font-medium text-slate-700">Student Card (Green Theme)</h3>
          <ListItemCard
            item={sampleStudent}
            colorScheme="green"
            actions={sampleActions}
            className="max-w-md"
          />
        </div>
      </section>

      {/* ResponsiveGrid Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">ResponsiveGrid</h2>
        
        <ResponsiveGrid config="cards">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200">
              Grid Item {i + 1}
            </div>
          ))}
        </ResponsiveGrid>
      </section>

      {/* Loading States Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Loading States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-slate-700 mb-4">Content Loading</h3>
            <LoadingState type="content" message="Loading teachers..." />
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-slate-700 mb-4">Skeleton Grid</h3>
            <SkeletonGrid items={3} columns={1} />
          </div>
        </div>
      </section>

      {/* Empty States Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Empty States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <NoTeachersState 
              onAddTeacher={() => console.log('Add teacher')}
              onImportTeachers={() => console.log('Import teachers')}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <NoStudentsState 
              onAddStudent={() => console.log('Add student')}
              onImportStudents={() => console.log('Import students')}
            />
          </div>
        </div>
      </section>

      {/* Generic Empty State */}
      <section className="space-y-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <EmptyState
            type="no-results"
            colorScheme="orange"
            actions={{
              onPrimaryAction: () => console.log('Clear filters'),
              onSecondaryAction: () => console.log('Reset search')
            }}
          />
        </div>
      </section>
    </div>
  )
}

export default SharedComponentsDemo