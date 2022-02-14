import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";

interface IArgs {
  listId: string;
  entryId: string;
}

export default async function removeEntryFromList({listId, entryId}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("removeEntryFromList -> no user found in context");
    return false;
  } 

  const lid = new Types.ObjectId(listId);
  const eid = new Types.ObjectId(entryId);

  const update = { $pull: { entries: {_id: eid} } }
  const doc = await List.findOneAndUpdate({'_id': lid}, update);

  if (doc) {
    return true;
  }

  return false;
}