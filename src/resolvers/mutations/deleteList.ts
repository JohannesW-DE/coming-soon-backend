import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  id: string,
}

export default async function deleteList({id}: IArgs, context: IContext){
  if (!context.user) {
    console.log("deleteList -> no user found in context");
    return false;
  }

  const lid = new Types.ObjectId(id);
  const uid = new Types.ObjectId(context.user._id);

  const list = await List.findOne({'_id': lid});
  const user = await User.findOne({'_id': uid});

  if (list && user && list.owner._id.equals(uid)) {
    const removed = await list.remove();
    if (removed) {
      await User.updateMany({}, {
        $pull: {
          bookmarks: {
            list: lid,
          },
        }
      })
      return true;
    }
  }

  return false;
}
