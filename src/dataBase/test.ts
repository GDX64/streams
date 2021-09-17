import Dexie from 'dexie';
import * as R from 'ramda';

interface Friend {
  id?: number;
  name?: string;
  age?: number;
}

//
// Declare Database
//
class FriendDatabase extends Dexie {
  public friends: Dexie.Table<Friend, number>; // id is number in this case
  public binData: Dexie.Table<{ data: ArrayBuffer }, number>; // id is number in this case
  public other: Dexie.Table<{ name: string; data: any }, number>; // id is number in this case

  public constructor() {
    super('FriendDatabase');
    this.version(1).stores({
      friends: '++id,name,age',
      binData: '++id',
      other: 'name',
    });
    this.friends = this.table('friends');
    this.binData = this.table('binData');
    this.other = this.table('other');
  }
}

function getRandomFriend(name: string) {
  return { id: Math.random(), age: Math.random(), name };
}

async function friendsTest() {
  const db = new FriendDatabase();
  console.time('add');
  const result = await Promise.all(
    R.range(0, 1000).map(() => db.friends.add(getRandomFriend('add')))
  );
  console.log(result);
  console.timeEnd('add');
  const arrFriends = R.range(0, 1000).map(() => getRandomFriend('bulkAdd'));
  console.time('bulk');
  const bulkResult = await db.friends.bulkAdd(arrFriends);
  console.timeEnd('bulk');
  console.log(bulkResult);

  const bin = new Uint32Array(50_0000);
  console.time('binData');
  const key = await db.binData.add({ data: bin });
  console.log(key);
  console.timeEnd('binData');
  console.time('binDataGet');
  console.log(await db.binData.get(3));
  console.timeEnd('binDataGet');

  db.other.add({ name: 'asdf', data: 10 });
}

export function doDBStuff() {
  friendsTest();
}
