import { useState, useEffect } from "react";
import { db } from "../../../Firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "firebase/firestore";

const ManageStudents = () => {

    const [students, setStudents] = useState([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        class: "",
        parentId: ""
    });

    // 🔥 FETCH STUDENTS
    const fetchStudents = async () => {
        const snap = await getDocs(collection(db, "students"));
        const data = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        setStudents(data);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // 🔥 ADD / UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.class || !form.parentId) {
            alert("Fill all fields");
            return;
        }

        if (editingId) {
            // ✏️ UPDATE
            await updateDoc(doc(db, "students", editingId), {
                ...form,
                parentId: form.parentId.toUpperCase()
            });
            setEditingId(null);
        } else {
            // ➕ ADD
            await addDoc(collection(db, "students"), {
                ...form,
                parentId: form.parentId.toUpperCase(),
                createdAt: new Date().toISOString()
            });
        }

        setForm({ name: "", class: "", parentId: "" });
        fetchStudents();
    };

    // 🔥 DELETE
    const handleDelete = async (id) => {
        await updateDoc(doc(db, "students", id), {
            deleted: true,
        });

        fetchStudents();
    };

    // 🔥 RESTORE
    const handleRestore = async (id) => {
        await updateDoc(doc(db, "students", id), {
            deleted: false,
        });
        fetchStudents();
    };

    // 🔥 PERMANENT DELETE  
    const handlePermanentDelete = async (id) => {
        await deleteDoc(doc(db, "students", id));
        fetchStudents();
    };

    // 🔥 EDIT LOAD
    const handleEdit = (student) => {
        setForm({
            name: student.name,
            class: student.class,
            parentId: student.parentId
        });
        setEditingId(student.id);
    };

    // 🔍 FILTER + SEARCH
    const filteredStudents = students.filter(s =>
        (showDeleted ? s.deleted : !s.deleted) &&
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedClass ? s.class === selectedClass : true)
    );

    return (
        <div className="p-6 space-y-6">

            <h1 className="text-2xl font-bold">Manage Students</h1>

            {/* 🔍 SEARCH + FILTER */}
            <div className="flex flex-col md:flex-row gap-4">

                <input
                    type="text"
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field w-full"
                />

                <input
                    type="text"
                    placeholder="Filter by class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="input-field w-full"
                />

            </div>

            {/* ➕ ADD / EDIT FORM */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">

                <h2 className="font-semibold">
                    {editingId ? "Edit Student" : "Add Student"}
                </h2>

                <input
                    type="text"
                    placeholder="Student Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field w-full"
                />

                <input
                    type="text"
                    placeholder="Class"
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="input-field w-full"
                />

                <input
                    type="text"
                    placeholder="Parent ID"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="input-field w-full"
                />

                <button className="btn-primary w-full">
                    {editingId ? "Update Student" : "Add Student"}
                </button>
            </form>

            {/* 📋 STUDENT LIST */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex justify-between items-center mb-4">

                        <h2 className="text-lg font-semibold">
                            {showDeleted ? "Recycle Bin" : "Students List"}
                        </h2>

                    </div>
                    <span className="text-sm text-gray-400">
                        Total: {filteredStudents.length}
                    </span>
                </div>

                <div className="flex justify-between items-center mb-4">

                    <button
                        onClick={() => setShowDeleted(!showDeleted)}
                        className="px-3 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
                    >
                        {showDeleted ? "Back to Students" : "Open Recycle Bin"}
                    </button>

                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">

                        {/* TABLE HEADER */}
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Parent ID</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-400">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((s, index) => (
                                    <tr
                                        key={s.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>

                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {s.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                                                Class {s.class}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {s.parentId}
                                        </td>

                                        <td className="px-4 py-3 text-right space-x-2">

                                            {!showDeleted ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(s)}
                                                        className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleRestore(s.id)}
                                                        className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded"
                                                    >
                                                        Restore
                                                    </button>

                                                    <button
                                                        onClick={() => handlePermanentDelete(s.id)}
                                                        className="px-3 py-1 text-xs bg-red-200 text-red-700 rounded"
                                                    >
                                                        Delete Forever
                                                    </button>
                                                </>
                                            )}

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

        </div>
    );
};

export default ManageStudents;