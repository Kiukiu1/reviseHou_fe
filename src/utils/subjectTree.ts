import type { Faculty, Major, Subject } from '../types/document'

export interface MajorNode extends Omit<Major, 'faculty'> {
  subjects: Subject[]
}

export interface FacultyNode extends Faculty {
  majors: MajorNode[]
}

const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, 'vi')

export function buildSubjectTree(subjects: Subject[]): FacultyNode[] {
  const faculties = new Map<number, FacultyNode>()
  const majors = new Map<number, MajorNode>()

  for (const subject of subjects) {
    const major = subject.major
    if (!major || major.status !== 'ACTIVE' || major.faculty.status !== 'ACTIVE') continue

    let facultyNode = faculties.get(major.faculty.id)
    if (!facultyNode) {
      facultyNode = { ...major.faculty, majors: [] }
      faculties.set(major.faculty.id, facultyNode)
    }

    let majorNode = majors.get(major.id)
    if (!majorNode) {
      const { faculty: _faculty, ...rest } = major
      majorNode = { ...rest, subjects: [] }
      majors.set(major.id, majorNode)
      facultyNode.majors.push(majorNode)
    }
    majorNode.subjects.push(subject)
  }

  const tree = [...faculties.values()].sort(byName)
  for (const faculty of tree) faculty.majors.sort(byName)
  return tree
}

export function facultyNameOf(subject: Subject) {
  return subject.major?.faculty.name ?? null
}
