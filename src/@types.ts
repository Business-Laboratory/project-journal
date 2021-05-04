// taken from https://www.jpwilliams.dev/how-to-unpack-the-return-type-of-a-promise-in-typescript
export type UnwrapPromise<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : T

// Taken from https://stackoverflow.com/questions/52910047/convert-all-date-properties-including-nested-to-string-in-a-typescript-generic
export type SerializeDates<T> = {
  [P in keyof T]: T[P] extends Date ? string : SerializeDates<T[P]>
}

export type PrepareAPIData<T> = SerializeDates<UnwrapPromise<T>>

export type QueryData<T extends (...args: any) => any> = Exclude<
  ReturnType<T>['data'],
  undefined
>
