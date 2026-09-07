import sqlalchemy.exc as sqlalchemy_exceptions


class ObjectNotFound(sqlalchemy_exceptions.NoResultFound):
    pass
