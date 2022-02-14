import { List } from "../../schema/List";
import { IContext } from "../../schema/types";

interface IArgs {
  listId: string;
  ids: string[];
}

export default async function updatePositions({listId, ids}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updatePositions -> no user found in context");
    return;
  }

  const list = await List.findOne({_id: listId});
  
  if (list && list.owner._id.equals(context.user._id)) {
    const entries = list.toObject().entries.map((e) => {
      const idx = ids.indexOf(e._id.toString())
      if (idx !== -1) {
        return {...e, position: idx + 1}
      } else {
        return {...e,};
      }
    })
    list.entries = entries;
    const doc = await list.save();
    if (doc) {
      return true;
    }
  }

  return false;
}
