
import CoursesTable from './courses-table';

export default function CoursesPage() {
    return (
        <div className="space-y-4">
            {/* The CoursesTable component now handles its own data fetching. */}
            <CoursesTable initialCourses={[]} />
        </div>
    );
}
