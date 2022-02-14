import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";

interface IArgs {
  listId: string;
  entryId: string;
  comment: string;
}

export default async function updateComment({listId, entryId, comment}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateComment -> no user found in context");
    return false;
  }   

  const lid = new Types.ObjectId(listId)
  const eid = new Types.ObjectId(entryId)

  const list = await List.findOne({_id: lid});

  if (list && list.owner._id.equals(context.user._id)) {
    const doc = await List.findOneAndUpdate(
      {
        '_id': lid,
        'entries._id': eid,
      },
      {
        $set: {'entries.$.comment': comment}
      }
    )
    if (doc) {
      return true;
    }
  }
  return false;
}