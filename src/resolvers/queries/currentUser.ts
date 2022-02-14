import { List } from "../../schema/List";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IArgs {}

export default async function currentUser(args: IArgs, context: IContext) {
  if (!context.user) {
    console.log("currentUser -> no user found in context");
    return;
  }

  const user = await User.findOne({_id: context.user._id}).populate("bookmarks.list").lean();
  if (user) {
    const lists = await List.find({owner: user}).lean();
    return {...user, lists};
  }

  return;
}