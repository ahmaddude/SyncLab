import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo', title: 'To Do', dot: 'bg-neutral-500' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-blue-500' },
  { id: 'review', title: 'Review', dot: 'bg-amber-500' },
  { id: 'done', title: 'Done', dot: 'bg-emerald-500' },
];

export default function KanbanBoard({ tasks, onDragEnd, onTaskClick }) {
  const getColumnTasks = (status) => {
    return tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);

          return (
            <div key={column.id} className="flex-shrink-0 w-72 rounded-xl bg-neutral-900 border border-neutral-800 p-3">
              <div className="flex items-center gap-2.5 mb-3 px-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                <h3 className="text-sm font-semibold text-neutral-300">{column.title}</h3>
                <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[200px] rounded-xl p-0.5 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-teal-500/5 ring-1 ring-teal-500/30 ring-inset' : ''
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
                            className={`${snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-xl shadow-black/30' : ''} transition-transform duration-150`}
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
