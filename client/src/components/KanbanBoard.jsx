import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'Review', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

export default function KanbanBoard({ tasks, onDragEnd, onTaskClick }) {
  const getColumnTasks = (status) => {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[200px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary-50' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}`}
                          >
                            <TaskCard task={task} onClick={onTaskClick} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
