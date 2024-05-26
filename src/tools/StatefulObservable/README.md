`StatefulObservable` is a construct that allow to avoid having to depend on [EVT](https://evt.land).

A `StatefulObservable` can be converted to an evt with:

```ts
import { statefulObservableToStatefulEvt } from "powerhooks/tools/StatefulObservable/statefulObservableToStatefulEvt";

const evtXyz = statefulObservableToStatefulEvt({
    statefulObservable: $xyz
    //Optionally you can pass a Ctx
});
```

WARNING: Unlike `StatefulEvt`, `StatefulObservable` do not post when we first attach.
If the current value was not yet evaluated `next()` is called on the initial value returned by the function that
returns it.
