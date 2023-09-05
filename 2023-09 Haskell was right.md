# Haskell was right

It's somewhat ironic that many programmers think that the (IO) monad is overly complicated and solves problems that could only ever exist in a pure lazy functional programming language; Yet, at the same time, are convinced that the following code should be considered good practice:

```c#
public class Processor : IProcessor
{
    private static readonly IDbConnector dbConnector;

    public async Task<...> ProcessData(string arguments)
    {
        var data = await dbConnector.QueryAsync(arguments);
        return TransformData(data);
    }
}
```
... where IO is explicitly marked in three different places.
- `async` because you do not want your app to lag or your web server run out of threads.
- `IDbConnector` because you _might_ want to mock IO away for testing.
- `IProcessor` because correctly mocking a database connector is hard and you don't want to deal with that.

Maybe, just maybe, academia has good reasons for handling things in a certain way.