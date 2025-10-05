"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Phone, Edit, Trash2 } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  phone: string;
  qualification: string;
  experience: string;
  status: "Active" | "On Leave" | "Inactive";
  classes: number;
}

interface TeacherCardProps {
  teacher: Teacher;
  index: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TeacherCard({ teacher, index, onEdit, onDelete }: TeacherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 border-slate-200/60 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {teacher.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {teacher.id}
                </p>
              </div>
              <Badge
                variant={
                  teacher.status === "Active"
                    ? "default"
                    : "secondary"
                }
                className={
                  teacher.status === "Active"
                    ? "bg-orange-100 text-orange-800 border-orange-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {teacher.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Department:</span>
                <p className="font-medium text-slate-900">
                  {teacher.department}
                </p>
              </div>
              <div>
                <span className="text-slate-500">
                  Qualification:
                </span>
                <p className="font-medium text-slate-900">
                  {teacher.qualification}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Experience:</span>
                <p className="font-medium text-slate-900">
                  {teacher.experience}
                </p>
              </div>
              <div>
                <span className="text-slate-500">
                  Active Classes:
                </span>
                <p className="font-medium text-slate-900">
                  {teacher.classes}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{teacher.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{teacher.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              onClick={() => onEdit?.(teacher.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              onClick={() => onDelete?.(teacher.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}