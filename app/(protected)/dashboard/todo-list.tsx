import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import {
  AddTodoForm,
  TodoListContainer,
  TodoCompleteButton,
  TodoEmptyState,
  TodoItem,
  TodoList as TodoListComponent,
  TodoRemoveButton,
  TodoText,
} from './components/todo-components';

export const TodoList = () => {
  const todos = useQuery(api.todos.todos.get) ?? [];
  const create = useMutation(api.todos.todos.create);
  const toggle = useMutation(api.todos.todos.toggle);
  const remove = useMutation(api.todos.todos.remove);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTodo = formData.get('text') as string;
    await create({ text: newTodo.trim() });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <TodoListContainer>
      <AddTodoForm onSubmit={handleSubmit} />
      <TodoListComponent>
        {todos.map((todo) => (
          <TodoItem key={todo._id}>
            <TodoCompleteButton
              completed={todo.completed}
              onClick={() => toggle({ id: todo._id })}
            />
            <TodoText text={todo.text} completed={todo.completed} />
            <TodoRemoveButton onClick={() => remove({ id: todo._id })} />
          </TodoItem>
        ))}
      </TodoListComponent>
      {todos.length === 0 && <TodoEmptyState />}
    </TodoListContainer>
  );
};
