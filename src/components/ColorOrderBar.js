import { DndContext, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { SmartPointerSensor } from './SmartPointerSensor';
import { Tag, Popover, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

function ColorOrderBar({ tabItems, colorOrder, changeColorOrder }){
    const sensors = useSensors(useSensor(SmartPointerSensor));
    const [adding, changeAdding] = useState(false);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        // console.log("handleDragEnd", active, over);
        if (!over) return;
        if (active.id !== over.id) {
            changeColorOrder((data) => {
                const oldIndex = data.findIndex((item) => item.id === active.id);
                const newIndex = data.findIndex((item) => item.id === over.id);
                return arrayMove(data, oldIndex, newIndex);
            });
        }
    };

    const addTag = (value) => {
        // console.log("addTag", value);
        const newColorOrder = {
            label: tabItems[value].label,
            id: value,
            color: tabItems[value].color
        }
        changeColorOrder([...colorOrder, newColorOrder]);
    }

    const removeTag = (value) => {
        // console.log("removeTag", value);
        const newTags = colorOrder.filter((tag) => tag.id !== value);
        changeColorOrder(newTags);
    };

    const isInColorOrder = (id) => {
        let res = false;
        colorOrder.forEach((item) => {
            if(id === item.id){
                res = true;
            }
        });
        return res;
    }

    const DraggableTag = ({ tag }) => {
        const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: tag.id,
        });

        const commonStyle = {
            cursor: 'move',
            transition: 'unset', // Prevent element from shaking after drag
        };

        const style = transform
            ? {
                ...commonStyle,
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
                transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
            }
            : commonStyle;

        return (
            <Tag
                closable
                onClose={(e) => {
                    e.preventDefault();
                    removeTag(tag.id);
                }}
                color={tag.color}
                style={style}
                ref={setNodeRef}
                {...listeners}
            >
                {tag.label}
            </Tag>
        );
    };

    return (
        <div className='element'>
            <p>Color Order:</p>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <SortableContext items={colorOrder} strategy={horizontalListSortingStrategy}>
                    {colorOrder.map((item) => (
                        <DraggableTag tag={item} key={item.id} />
                    ))}
                </SortableContext>
            </DndContext>
            {colorOrder.length === tabItems.length ? <></> : 
                <Popover
                    placement="bottomLeft"
                    content={tabItems
                        .filter((item) => !isInColorOrder(item.key))
                        .map((item) => (
                            <Button style={{ color: "white", backgroundColor: item.color }} onClick={() => addTag(item.key)}>
                                {item.label}
                            </Button>
                        ))
                    }
                    trigger="click"
                    open={adding}
                    onOpenChange={(newOpen) => changeAdding(newOpen)}
                >
                    <Tag style={{ borderStyle: 'dashed' }} icon={<PlusOutlined />}>
                        New Link
                    </Tag>
                </Popover>
            }
        </div>
    );
};

export default ColorOrderBar;