
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilePenLine, Plus, Trash2 } from "lucide-react";

const courses = [
    {
        name: "Introduction to Programming",
        instructor: "Dr. Emily Carter",
        credits: 3,
    },
    {
        name: "Calculus I",
        instructor: "Prof. David Lee",
        credits: 4,
    },
    {
        name: "Linear Algebra",
        instructor: "Dr. Sarah Jones",
        credits: 3,
    },
];

export default function CoursesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">COURSE NAME</TableHead>
                <TableHead className="font-semibold">INSTRUCTOR</TableHead>
                <TableHead className="font-semibold">CREDITS</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow key={index}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
