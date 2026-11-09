"use client";

import {
Activity,
ArrowDownRight,
ArrowUpRight,
Bell,
CalendarDays,
CheckCircle2,
ChevronDown,
Clock3,
DollarSign,
FileText,
LayoutDashboard,
Menu,
Plus,
Search,
Settings,
Users,
Wrench,
X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
{ label: "Dashboard", icon: LayoutDashboard, active: true },
{ label: "Jobs", icon: Wrench },
{ label: "Customers", icon: Users },
{ label: "Schedule", icon: CalendarDays },
{ label: "Invoices", icon: FileText },
];

const jobs = [
{
id: "JOB-1042",
customer: "John Kamara",
service: "Air conditioner repair",
technician: "Michael Conteh",
date: "Today, 09:00 AM",
status: "In Progress",
},
{
id: "JOB-1041",
customer: "Sarah Williams",
service: "Plumbing inspection",
technician: "David Johnson",
date: "Today, 10:30 AM",
status: "Scheduled",
},
{
id: "JOB-1040",
customer: "Abdul Sesay",
service: "AC installation",
technician: "Michael Conteh",
date: "Today, 01:00 PM",
status: "Scheduled",
},
{
id: "JOB-1039",
customer: "Mary Koroma",
service: "Pipe leakage repair",
technician: "James Bangura",
date: "Yesterday",
status: "Completed",
},
];

const appointments = [
{
time: "09:00 AM",
customer: "John Kamara",
service: "AC repair",
color: "bg-blue-500",
},
{
time: "10:30 AM",
customer: "Sarah Williams",
service: "Plumbing inspection",
color: "bg-amber-500",
},
{
time: "01:00 PM",
customer: "Abdul Sesay",
service: "AC installation",
color: "bg-emerald-500",
},
];

function StatusBadge({ status }: { status: string }) {
const styles: Record<string, string> = {
"In Progress": "bg-blue-50 text-blue-700",
Scheduled: "bg-amber-50 text-amber-700",
Completed: "bg-emerald-50 text-emerald-700",
};

return (
<span
className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
>
{status} </span>
);
}

function MetricCard({
title,
value,
change,
description,
icon: Icon,
}: {
title: string;
value: string;
change: string;
description: string;
icon: typeof DollarSign;
}) {
return ( <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between"> <p className="text-sm font-medium text-gray-500">{title}</p> <div className="rounded-lg bg-gray-100 p-2"> <Icon className="h-5 w-5 text-gray-600" /> </div> </div>

  <div className="mt-4 flex items-end justify-between">
    <h3 className="text-2xl font-bold tracking-tight text-gray-900">
      {value}
    </h3>
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
      <ArrowUpRight className="h-4 w-4" />
      {change}
    </span>
  </div>
  <p className="mt-2 text-xs text-gray-500">{description}</p>
</div>

);
}

export default function Home() {
const [menuOpen, setMenuOpen] = useState(false);
const [activePage, setActivePage] = useState("Dashboard");

return ( <div className="min-h-screen bg-gray-50 text-gray-900"> <div className="flex min-h-screen">
{menuOpen && (
<button
aria-label="Close navigation menu"
className="fixed inset-0 z-40 bg-black/40 lg:hidden"
onClick={() => setMenuOpen(false)}
/>
)}

    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              FieldPro
            </h1>
            <p className="text-xs text-gray-500">Service Management</p>
          </div>
        </div>

        <button
          aria-label="Close menu"
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActivePage(item.label);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                activePage === item.label
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 p-4">
        <button
          onClick={() => setActivePage("Settings")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
            activePage === "Settings"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            AD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Admin Demo</p>
            <p className="truncate text-xs text-gray-500">Administrator</p>
          </div>
          <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
        </div>
      </div>
    </aside>

    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h2 className="text-lg font-bold">Dashboard</h2>
            <p className="hidden text-xs text-gray-500 sm:block">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Search"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="hidden items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 sm:flex">
            <Plus className="h-4 w-4" />
            New Job
          </button>
        </div>
      </header>

      <div className="space-y-7 p-4 sm:p-6 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Monday, November 3, 2026
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Business Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor your service operations at a glance.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50">
            <CalendarDays className="h-4 w-4" />
            This month
            <ChevronDown className="h-4 w-4" />
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value="$24,850"
            change="12.5%"
            description="Compared with last month"
            icon={DollarSign}
          />
          <MetricCard
            title="Active Jobs"
            value="18"
            change="8.2%"
            description="Jobs currently in progress"
            icon={Wrench}
          />
          <MetricCard
            title="Total Customers"
            value="126"
            change="5.4%"
            description="Registered customers"
            icon={Users}
          />
          <MetricCard
            title="Outstanding Invoices"
            value="$4,250"
            change="3.1%"
            description="Awaiting customer payment"
            icon={FileText}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white xl:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="font-semibold">Recent Jobs</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Latest service activities
                </p>
              </div>
              <button className="text-sm font-medium text-blue-700 hover:text-blue-900">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Job</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Technician</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {job.id}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {job.service}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {job.customer}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {job.technician}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
              Showing 4 sample jobs
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="font-semibold">Today's Schedule</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Upcoming appointments
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-5 p-5">
              {appointments.map((appointment) => (
                <div key={appointment.time} className="flex gap-3">
                  <div className="w-20 shrink-0 pt-1 text-xs font-semibold text-gray-500">
                    {appointment.time}
                  </div>
                  <div className="relative flex-1 border-l border-gray-200 pl-4 pb-1">
                    <span
                      className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${appointment.color}`}
                    />
                    <p className="text-sm font-semibold">
                      {appointment.customer}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {appointment.service}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-5">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium hover:bg-gray-50">
                <CalendarDays className="h-4 w-4" />
                View schedule
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
            <div className="rounded-lg bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Service performance</p>
              <p className="mt-1 text-sm text-gray-500">
                32 jobs completed this month in this demo dashboard.
              </p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                <ArrowUpRight className="mr-1 inline h-4 w-4" />
                9.2% improvement
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
            <div className="rounded-lg bg-amber-50 p-3">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Pending work</p>
              <p className="mt-1 text-sm text-gray-500">
                6 jobs are waiting for assignment or scheduling.
              </p>
              <p className="mt-3 text-sm font-semibold text-amber-700">
                <ArrowDownRight className="mr-1 inline h-4 w-4" />
                Needs attention
              </p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-gray-400">
          FieldPro ERP · Development Preview · All figures are sample data
        </p>
      </div>
    </main>
  </div>
</div>
  );
}

