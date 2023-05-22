"use client";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import useUser from "csc-start/hooks/useUser";
import useUserMustBeLogged from "csc-start/hooks/useUserMustBeLogged";
import {
  addNewTodoItem,
  getTodoItems,
  updateTodoItem,
  deleteTodoItem, // Add the deleteTodoItem function
} from "csc-start/utils/data";
import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import { Box, Fade, TextField, Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Profile = () => {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [todoItems, setTodoItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Track selected item for editing
  const [selectedTask, setSelectedTask] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Track delete confirmation modal open state
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null); // Track selected item for deletion

  
  const handleOpen = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setTitle(item.title);
      setTasks(item.tasks);
    } else {
      setSelectedItem(null);
      setTitle("");
      setTasks([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    setTitle("");
    setTasks([]);
  };


  const handleDeleteOpen = (item) => {
  setSelectedItemToDelete(item);
  setDeleteModalOpen(true);
};

const handleDeleteClose = () => {
  setSelectedItemToDelete(null);
  setDeleteModalOpen(false);
};

const deleteTodoList = async (e) => {
  e.preventDefault();
  if (selectedItemToDelete) {
    const result = await deleteTodoItem(selectedItemToDelete.id);
    if (result.success) {
      const updatedItems = todoItems.filter((item) => item.id !== selectedItemToDelete.id);
      setTodoItems(updatedItems);
    } else {
      // Handle error
    }
  }
  handleDeleteClose();
};


  const { user, refreshUser, error, loading } = useUser();
  useUserMustBeLogged(user, "in", "/login");

  useEffect(() => {
    if (user) {
      const fetchTodoItems = async () => {
        const todoItemsData = await getTodoItems(user.id);
        if (todoItemsData.success) {
          setTodoItems(todoItemsData.data);
        }
      };

      fetchTodoItems();
    }
  }, [user]);

  const addTodoItem = async (e) => {
    e.preventDefault();

    if (selectedItem) {
      // Updating existing item
      const updatedTodoItem = await updateTodoItem(
        selectedItem.id,
        tasks,
        title
      );
      // if (updatedTodoItem.success === false) {
      //   // Handle error
      //   return;
      // }

      const updatedItems = todoItems.map((item) => {
        if (item.id === selectedItem.id) {
          return { ...item, title, tasks };
        }
        return item;
      });

      setTodoItems(updatedItems);
    } else {
      // Adding new item
      const order = todoItems ? todoItems.length + 1 : 1;
      const completed = false;

      const addedTodoItem = await addNewTodoItem(
        user.id,
        tasks,
        title,
        order,
        completed
      );
      if (addedTodoItem.success === false) {
        // Handle error
        return;
      }

      setTodoItems([...todoItems, addedTodoItem.data]);
    }

    handleClose();
    refreshUser();
    // Handle success
  };


  const updateTaskCompletion = async (itemId, taskIndex, completed) => {
    const updatedTodoItems = [...todoItems];
    const itemIndex = updatedTodoItems.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      updatedTodoItems[itemIndex].tasks[taskIndex].completed = completed;
      setTodoItems(updatedTodoItems);
  
      // Update the completed status in Supabase or your preferred data source
      await updateTodoItem(itemId, updatedTodoItems[itemIndex].tasks);
    }
  };

  
  const handleTaskChange = (e) => {
    setSelectedTask(e.target.value);
  };

  const handleAddTask = () => {
    if (selectedTask.trim() !== "") {
      setTasks([...tasks, selectedTask]);
      setSelectedTask("");
    }
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
      <div className="container mx-auto pb-10">
        {!!error && (
          <div className="bg-red-200 border-2 border-red-800 text-red-800 py-2 px-5 my-10 text-center">
            <span className="font-bold">{error.message}</span>
          </div>
        )}
        {loading && <p>Loading...</p>}
        {!error && !loading && (
          <div>
            <p className="text-4xl text-white font-bold my-5">Todo List</p>
            <button
              className="button small bg-white text-blue-900 font-bold mt-8"
              onClick={() => handleOpen()}
            >
              Add Todo Item
            </button>
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              open={open}
              onClose={handleClose}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{
                backdrop: {
                  timeout: 500,
                },
              }}
            >
              <Fade in={open}>
                <Box sx={style}>
                  <form onSubmit={addTodoItem}>
                    <Typography variant="h6" component="h2" mb={2}>
                      Title:
                    </Typography>
                    <TextField
                      id="title"
                      label="Title"
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <Typography variant="h6" component="h2" mt={3} mb={2}>
                      Tasks:
                    </Typography>
                    <div className="flex">
                      <TextField
                        id="tasks"
                        label="Tasks"
                        variant="outlined"
                        fullWidth
                        value={selectedTask}
                        onChange={handleTaskChange}
                      />
                      <button
                        type="button"
                        className="button small bg-green-500 text-white font-bold ml-2"
                        onClick={handleAddTask}
                      >
                        Add
                      </button>
                    </div>
                    <ul className="border rounded-lg p-4 mt-3">
                      {Array.isArray(tasks) &&
                        tasks.map((task, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between border-b-2 py-2"
                          >
                            <FormControlLabel
                              control={<Checkbox />}
                              label={task}
                            />
                            <button
                              type="button"
                              className="button small bg-red-500 text-white font-bold"
                              onClick={() => handleRemoveTask(index)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                    </ul>
                    <button
                      type="submit"
                      className="button small bg-blue-500 text-white font-bold mt-4"
                    >
                      Save
                    </button>
                  </form>
                </Box>
              </Fade>
            </Modal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 todo-container">
              {todoItems.map((item) => (
                <div
                  key={item?.id}
                  className="bg-gray-200 rounded-lg p-6 text-gray-800 shadow-md todo-item"
                >
                  <img
                    src="https://clickup.com/blog/wp-content/uploads/2019/01/to-do-list-apps.png"
                    alt="To-Do List"
                    className="h-24 w-24 mx-auto mb-4"
                  />
                  <h5 className="text-xl font-bold mb-4 text-center">
                    {item?.title ?? "Untitled"}
                  </h5>

                  <table className="border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="p-2 border text-left">Task</th>
                        <th className="p-2 border text-left">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(item?.tasks) &&
                        item.tasks.map((task, index) => (
                          <tr key={index}>
                            <td className="p-2 border">
                              <FormControlLabel
                                control={<Checkbox />}
                                label={task}
                              />
                            </td>

                            <td className="p-2 border">
                              {item?.completed ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  <div className="flex justify-center mt-4">
      <button
        className="button small bg-blue-500 text-white font-bold mr-2"
        onClick={() => handleOpen(item)} // Edit button
      >
        Edit
      </button>
      <button
        className="button small bg-red-500 text-white font-bold"
        onClick={() => handleDeleteOpen(item)} // Delete button
      >
        Delete
      </button>
    </div>
  </div>
))}
<Modal
  aria-labelledby="delete-confirmation-modal-title"
  aria-describedby="delete-confirmation-modal-description"
  open={deleteModalOpen}
  onClose={handleDeleteClose}
  closeAfterTransition
  slots={{ backdrop: Backdrop }}
  slotProps={{
    backdrop: {
      timeout: 500,
    },
  }}
>
  <Fade in={deleteModalOpen}>
    <Box sx={style}>
      <Typography variant="h6" component="h2" mb={2}>
        Are you sure you want to delete this todo list?
      </Typography>
      <Typography variant="body1" id="delete-confirmation-modal-description" mb={4}>
        This action cannot be undone.
      </Typography>
      <div className="flex justify-end">
        <button
          className="button small bg-red-500 text-white font-bold"
          onClick={deleteTodoList}
        >
          Delete
        </button>
        <button
          className="button small bg-gray-500 text-white font-bold ml-2"
          onClick={handleDeleteClose}
        >
          Cancel
        </button>
      </div>
    </Box>
  </Fade>
</Modal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
